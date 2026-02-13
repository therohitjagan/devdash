import { commitAnalysisQueue } from '../jobs/queues.js';
export async function queueCommitAnalysis(req, res) {
    const { repoUrl } = req.body;
    if (!repoUrl) {
        res.status(400).json({ message: 'repoUrl is required' });
        return;
    }
    const job = await commitAnalysisQueue.add('analyze', { repoUrl });
    res.status(202).json({ jobId: job.id });
}
export async function getCommitAnalysisStatus(req, res) {
    const rawJobId = req.params.jobId;
    const jobId = Array.isArray(rawJobId) ? rawJobId[0] : rawJobId;
    if (!jobId) {
        res.status(400).json({ message: 'jobId is required' });
        return;
    }
    const job = await commitAnalysisQueue.getJob(jobId);
    if (!job) {
        res.status(404).json({ message: 'Commit analysis job not found' });
        return;
    }
    const state = await job.getState();
    if (state === 'completed') {
        res.json({
            jobId,
            state,
            result: job.returnvalue,
        });
        return;
    }
    if (state === 'failed') {
        res.json({
            jobId,
            state,
            failedReason: job.failedReason,
        });
        return;
    }
    res.json({
        jobId,
        state,
        progress: typeof job.progress === 'number' ? job.progress : 0,
    });
}
