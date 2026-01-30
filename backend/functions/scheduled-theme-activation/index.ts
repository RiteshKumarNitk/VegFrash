import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
    const today = new Date()

    // 1. Check for upcoming festivals (starting in next 3 days or currently active)
    const { data: upcoming } = await supabase
        .from('festival_calendar')
        .select('*')
        .lte('start_date', new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString())
        .gte('end_date', today.toISOString())
        .order('start_date', { ascending: true })
        .limit(1)
        .maybeSingle()

    if (upcoming) {
        console.log(`Activating theme: ${upcoming.name}`)

        // 2. Activate theme
        const { error } = await supabase.from('active_themes').upsert({
            id: 'current',
            theme_id: upcoming.id,
            is_active: true,
            activated_at: new Date().toISOString(),
            rollout_percentage: 100
        })

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 })
        }

        // TODO: Send notification to users

        return new Response(JSON.stringify({ status: 'activated', theme: upcoming.name }), {
            headers: { 'Content-Type': 'application/json' },
        })
    } else {
        // Revert to default if no festival is active
        // Optionally check if we need to deactivate current

        // For MVP, simplistic logic:
        console.log('No active festival found.')
        return new Response(JSON.stringify({ status: 'no_change' }), {
            headers: { 'Content-Type': 'application/json' },
        })
    }
})
