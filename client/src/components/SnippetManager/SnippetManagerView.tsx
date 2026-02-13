import Editor from '@monaco-editor/react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { SectionCard } from '../Shared/SectionCard'
import { createSnippet, deleteSnippet, getSnippets, shareSnippet } from '../../services/devdashApi'

const starter = `export function vibeCheck(theme: string) {
  return theme === 'tokyo-night' ? 'legendary' : 'upgrade-needed'
}`

export function SnippetManagerView() {
  const [code, setCode] = useState(starter)
  const [title, setTitle] = useState('Tokyo Night helper')
  const [language, setLanguage] = useState('typescript')
  const [tagsInput, setTagsInput] = useState('tokyo-night, utility')
  const queryClient = useQueryClient()

  const snippetsQuery = useQuery({
    queryKey: ['snippets'],
    queryFn: getSnippets,
    retry: false,
  })

  const createMutation = useMutation({
    mutationFn: createSnippet,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['snippets'] })
      toast.success('Snippet saved')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSnippet,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['snippets'] })
      toast.success('Snippet removed')
    },
  })

  const shareMutation = useMutation({
    mutationFn: shareSnippet,
    onSuccess: async (data) => {
      try {
        await navigator.clipboard.writeText(data.shareUrl)
        toast.success('Share URL copied to clipboard')
      } catch {
        toast.success(`Share URL: ${data.shareUrl}`)
      }
    },
  })

  const submit = () => {
    createMutation.mutate({
      title,
      language,
      code,
      tags: tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    })
  }

  return (
    <SectionCard title="Snippet Manager" subtitle="Monaco-powered editor with collection-ready workflow scaffold">
      <div className="mb-3 grid gap-2 md:grid-cols-[1fr_170px_1fr_auto]">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="focus-ring rounded-lg border border-tn-border bg-tn-bg px-3 py-2 text-sm text-tn-text"
          placeholder="Snippet title"
        />
        <input
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="focus-ring rounded-lg border border-tn-border bg-tn-bg px-3 py-2 text-sm text-tn-text"
          placeholder="Language"
        />
        <input
          value={tagsInput}
          onChange={(event) => setTagsInput(event.target.value)}
          className="focus-ring rounded-lg border border-tn-border bg-tn-bg px-3 py-2 text-sm text-tn-text"
          placeholder="tag1, tag2"
        />
        <button
          type="button"
          onClick={submit}
          className="focus-ring rounded-lg border border-tn-blue/50 bg-tn-blue/10 px-3 py-2 text-sm text-tn-blue hover:bg-tn-blue/20"
        >
          Save
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-tn-border">
        <Editor
          height="360px"
          defaultLanguage="typescript"
          value={code}
          onChange={(value) => setCode(value ?? '')}
          theme="vs-dark"
          options={{ minimap: { enabled: false }, fontSize: 14, fontFamily: 'Commit Mono' }}
        />
      </div>

      <div className="mt-4 space-y-2">
        {snippetsQuery.data?.map((snippet) => (
          <article key={snippet.id} className="flex items-center justify-between rounded-lg border border-tn-border bg-tn-bg/70 px-3 py-2">
            <div>
              <p className="text-sm text-tn-text">{snippet.title}</p>
              <p className="text-xs text-tn-muted">{snippet.language} · {snippet.tags.join(', ')}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => shareMutation.mutate(snippet.id)}
                className="focus-ring rounded-md border border-tn-blue/40 px-2 py-1 text-xs text-tn-blue"
              >
                Share
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(snippet.id)}
                className="focus-ring rounded-md border border-tn-coral/40 px-2 py-1 text-xs text-tn-coral"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
        {snippetsQuery.isError ? <p className="text-xs text-tn-muted">Connect GitHub to load your snippets.</p> : null}
      </div>
    </SectionCard>
  )
}
