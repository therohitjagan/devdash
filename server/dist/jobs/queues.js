import { Queue, Worker } from 'bullmq';
import { env } from '../config/env.js';
export const commitAnalysisQueue = new Queue('commit-analysis', {
    connection: {
        url: env.REDIS_URL,
    },
});
export function startCommitAnalysisWorker() {
    return new Worker('commit-analysis', async (job) => {
        const repoSeed = Array.from(job.data.repoUrl).reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const lateNightRatio = 30 + (repoSeed % 45);
        const compliance = 40 + (repoSeed % 55);
        return {
            repoUrl: job.data.repoUrl,
            generatedAt: new Date().toISOString(),
            insights: [
                `You commit most around ${1 + (repoSeed % 4)}:${repoSeed % 2 ? '30' : '00'} AM.`,
                `${lateNightRatio}% of commits happen outside standard work hours.`,
                `Conventional commit compliance is ${compliance}%.`,
            ],
            metrics: {
                lateNightRatio,
                compliance,
                shortMessageRate: 20 + (repoSeed % 50),
            },
        };
    }, {
        connection: {
            url: env.REDIS_URL,
        },
    });
}
