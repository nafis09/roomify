const PROJECT_PREFIX = 'roomify_project_'

const jsonError = (status, message, extra = {}) => {
    return new Response(JSON.stringify({ error: message, ...extra }), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        }
    })
}

const getUserId = async (userPuter) => {
    try {
        const user = await userPuter.auth.getUser()

        return user?.uuid || null
    } catch {
        return null;
    }
}

router.get('/api/projects/list', async ({ user }) => {
    try {
        const userPuter = user?.puter
        if(!userPuter) return jsonError(401, 'Authentication failed')

        const userId = await getUserId(userPuter)
        if(!userId) return jsonError(401, 'Authentication failed')

        const listed = await userPuter.kv.list({ pattern: `${PROJECT_PREFIX}*`, returnValues: true })

        // puter.kv.list(..., true) returns key/value pairs; normalize defensively.
        const projects = Array.isArray(listed)
            ? listed.map((item) => {
                if(Array.isArray(item)) return item[1]
                if(item && typeof item === 'object' && 'value' in item) return item.value
                return null
            }).filter((v) => v !== null)
            : []

        return { projects }

    } catch (e) {
        return jsonError(500, "Failed to list projects", { message: e?.message || 'Unknown error' });
    }
})

router.get('/api/projects/get', async ({ request, user }) => {
    try {
        const userPuter = user?.puter
        if(!userPuter) return jsonError(401, 'Authentication failed')

        const userId = await getUserId(userPuter)
        if(!userId) return jsonError(401, 'Authentication failed')

        const url = new URL(request.url)
        const id = url.searchParams.get('id')
        if(!id) return jsonError(400, 'Missing project id')

        const key = `${PROJECT_PREFIX}${id}`
        const project = await userPuter.kv.get(key)

        if(!project) return jsonError(404, 'Project not found')
        return { project }

    } catch (e) {
        return jsonError(500, "Failed to get project", { message: e?.message || 'Unknown error' });
    }
})

router.post('/api/projects/save', async ({ request, user }) => {
    try {
        const userPuter = user?.puter

        if(!userPuter) return jsonError(401, 'Authentication failed')

        const body = await request.json()
        const project = body?.project

        if(!project?.id || !project?.sourceImage) return jsonError(400, 'Project ID and source both required')

        const payload = {
            ...project,
            updated_at: new Date().toISOString(),
        }

        const userId = await getUserId(userPuter)
        if(!userId) return jsonError(401, 'Authentication failed')

        const key = `${PROJECT_PREFIX}${project.id}`
        await userPuter.kv.set(key, payload)

        return { saved: true, id: project.id, project: payload }

    } catch (e) {
        return jsonError(500, "Failed to save project", { message: e?.message || 'Unknown error' });
    }
})
