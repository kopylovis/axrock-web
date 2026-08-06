import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import type { RichTextDoc } from "~/types/content";
import styles from "./admin.module.css";

function LinkIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-4.35-4.35a2 2 0 0 0-2.83 0L4 20" />
    </svg>
  );
}

interface RichTextEditorProps {
  value: RichTextDoc | null;
  onChange: (doc: RichTextDoc | null) => void;
  label: string;
}

export function RichTextEditor({ value, onChange, label }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      // Ссылки в StarterKit уже есть — отключаем, иначе расширение регистрируется дважды.
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: false }),
      Link.configure({ openOnClick: false, protocols: ["https", "http", "mailto"] }),
      Image,
    ],
    content: value ?? undefined,
    immediatelyRender: false,
    onUpdate: ({ editor: instance }) => {
      const json = instance.getJSON() as RichTextDoc;
      onChange(instance.isEmpty ? null : json);
    },
  });

  useEffect(() => {
    if (!editor || !value) return;
    const current = JSON.stringify(editor.getJSON());
    if (current !== JSON.stringify(value)) editor.commands.setContent(value);
    // Синхронизируем только при смене редактируемой записи.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) {
    return (
      <div className={styles.field}>
        <span className={styles.label}>{label}</span>
        <div className={styles.editorSurface} />
      </div>
    );
  }

  const button = (
    title: string,
    active: boolean,
    action: () => void,
    content: React.ReactNode,
  ) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`${styles.editorButton} ${active ? styles.editorButtonActive : ""}`}
      onClick={action}
    >
      {content}
    </button>
  );

  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>

      <div className={styles.editorToolbar} role="toolbar" aria-label="Форматирование текста">
        {button("Заголовок 2", editor.isActive("heading", { level: 2 }), () =>
          editor.chain().focus().toggleHeading({ level: 2 }).run(), "H2")}
        {button("Заголовок 3", editor.isActive("heading", { level: 3 }), () =>
          editor.chain().focus().toggleHeading({ level: 3 }).run(), "H3")}
        {button("Жирный", editor.isActive("bold"), () =>
          editor.chain().focus().toggleBold().run(), "Ж")}
        {button("Курсив", editor.isActive("italic"), () =>
          editor.chain().focus().toggleItalic().run(), "К")}
        {button("Маркированный список", editor.isActive("bulletList"), () =>
          editor.chain().focus().toggleBulletList().run(), "•")}
        {button("Нумерованный список", editor.isActive("orderedList"), () =>
          editor.chain().focus().toggleOrderedList().run(), "1.")}
        {button("Цитата", editor.isActive("blockquote"), () =>
          editor.chain().focus().toggleBlockquote().run(), "❝")}
        {button("Разделитель", false, () =>
          editor.chain().focus().setHorizontalRule().run(), "—")}
        <span className={styles.editorDivider} aria-hidden="true" />
        {button("Ссылка", editor.isActive("link"), () => {
          const previous = editor.getAttributes("link").href as string | undefined;
          const href = window.prompt("Адрес ссылки (https://…)", previous ?? "https://");
          if (href === null) return;
          if (href === "") {
            editor.chain().focus().unsetLink().run();
            return;
          }
          editor.chain().focus().setLink({ href }).run();
        }, <LinkIcon />)}
        {button("Изображение", false, () => {
          const src = window.prompt("Адрес изображения (https://…)");
          if (src) editor.chain().focus().setImage({ src }).run();
        }, <ImageIcon />)}
      </div>

      <div className={styles.editorSurface}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
