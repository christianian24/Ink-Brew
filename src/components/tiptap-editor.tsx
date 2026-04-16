"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Heading2, List, ListOrdered, Quote } from 'lucide-react'
import { Button } from './ui/button'

export default function TiptapEditor({ 
  content, 
  onChange 
}: { 
  content: string; 
  onChange: (content: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your story...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-coffee dark:prose-invert prose-lg focus:outline-none min-h-[400px] w-full max-w-none px-4 py-8 bg-white dark:bg-slate-950 border border-coffee-100 dark:border-slate-800 rounded-b-xl leading-relaxed text-coffee-900 dark:text-slate-100',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-col shadow-sm rounded-xl overflow-hidden">
      {/* Menu Bar */}
      <div className="flex items-center gap-1 p-2 bg-coffee-50 dark:bg-slate-900 border border-coffee-100 dark:border-slate-800 border-b-0 rounded-t-xl overflow-x-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-coffee-200 dark:bg-slate-700 dark:text-slate-50' : 'text-coffee-600 dark:text-slate-400 hover:bg-coffee-200 dark:hover:bg-slate-800 hover:text-coffee-900 dark:hover:text-slate-100'}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-coffee-200 dark:bg-slate-700 dark:text-slate-50' : 'text-coffee-600 dark:text-slate-400 hover:bg-coffee-200 dark:hover:bg-slate-800 hover:text-coffee-900 dark:hover:text-slate-100'}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <div className="w-px h-4 bg-coffee-300 dark:bg-slate-700 mx-2" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-coffee-200 dark:bg-slate-700 dark:text-slate-50' : 'text-coffee-600 dark:text-slate-400 hover:bg-coffee-200 dark:hover:bg-slate-800 hover:text-coffee-900 dark:hover:text-slate-100'}
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-coffee-200 dark:bg-slate-700 dark:text-slate-50' : 'text-coffee-600 dark:text-slate-400 hover:bg-coffee-200 dark:hover:bg-slate-800 hover:text-coffee-900 dark:hover:text-slate-100'}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-coffee-200 dark:bg-slate-700 dark:text-slate-50' : 'text-coffee-600 dark:text-slate-400 hover:bg-coffee-200 dark:hover:bg-slate-800 hover:text-coffee-900 dark:hover:text-slate-100'}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-coffee-200 dark:bg-slate-700 dark:text-slate-50' : 'text-coffee-600 dark:text-slate-400 hover:bg-coffee-200 dark:hover:bg-slate-800 hover:text-coffee-900 dark:hover:text-slate-100'}
        >
          <Quote className="w-4 h-4" />
        </Button>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}
