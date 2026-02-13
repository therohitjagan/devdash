import { redis } from '../services/redis.js';
function fallback() {
    return {
        commitsToday: 0,
        streakDays: 0,
        topRepo: 'n/a',
        languages: [
            { name: 'TypeScript', value: 40 },
            { name: 'JavaScript', value: 30 },
            { name: 'Python', value: 20 },
            { name: 'Go', value: 10 },
        ],
    };
}
export async function getGitHubStats(req, res) {
    if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }
    const accessToken = await redis.get(`github:token:${req.user.sub}`);
    if (!accessToken) {
        res.json({
            ...fallback(),
            message: 'GitHub token not found in cache. Reconnect GitHub to refresh stats.',
        });
        return;
    }
    const headers = {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'DevDash',
        'X-GitHub-Api-Version': '2022-11-28',
    };
    try {
        const [reposResponse, eventsResponse] = await Promise.all([
            fetch('https://api.github.com/user/repos?per_page=100&sort=updated', { headers }),
            fetch(`https://api.github.com/users/${req.user.username}/events?per_page=100`, { headers }),
        ]);
        if (!reposResponse.ok || !eventsResponse.ok) {
            res.json({ ...fallback(), message: 'GitHub API rate-limited or unavailable. Showing fallback stats.' });
            return;
        }
        const repos = (await reposResponse.json());
        const events = (await eventsResponse.json());
        const today = new Date().toDateString();
        const commitsToday = events.filter((event) => event.type === 'PushEvent' && new Date(event.created_at).toDateString() === today).length;
        const languageCount = new Map();
        for (const repo of repos) {
            if (!repo.language)
                continue;
            languageCount.set(repo.language, (languageCount.get(repo.language) ?? 0) + 1);
        }
        const languageTotal = Array.from(languageCount.values()).reduce((sum, value) => sum + value, 0) || 1;
        const languages = Array.from(languageCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([name, count]) => ({ name, value: Math.round((count / languageTotal) * 100) }));
        res.json({
            commitsToday,
            streakDays: Math.max(1, Math.min(365, events.filter((event) => event.type === 'PushEvent').length)),
            topRepo: repos[0]?.name ?? 'n/a',
            languages: languages.length > 0 ? languages : fallback().languages,
        });
    }
    catch {
        res.json({ ...fallback(), message: 'Failed to fetch live GitHub stats. Showing fallback stats.' });
    }
}
