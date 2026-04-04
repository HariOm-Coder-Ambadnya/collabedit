import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Collaboration from '@tiptap/extension-collaboration';

export default function CollabEditor({ docId, ydoc, currentUser, onEditorReady, onTyping }) {
  const typingTimer = useRef(null);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          // Disable history — Yjs handles undo/redo
          history: false,
        }),
        Underline,
        Placeholder.configure({
          placeholder: 'Start writing… others will see your changes in real time.',
        }),
        Collaboration.configure({
          document: ydoc,
          field: 'content',
        }),
      ],
      editorProps: {
        attributes: {
          class: 'tiptap-editor',
        },
      },
      onUpdate: () => {
        if (onTyping) {
          onTyping(true);
          if (typingTimer.current) clearTimeout(typingTimer.current);
          typingTimer.current = setTimeout(() => onTyping(false), 1500);
        }
      },
    },
    [ydoc]
  );

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor]);

  useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, []);

  return (
    <div className="w-full min-h-full">
      <EditorContent editor={editor} />
    </div>
  );
}
