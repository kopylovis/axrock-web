import { Fragment, type ReactNode } from "react";
import type { RichTextDoc, RichTextMark, RichTextNode } from "~/types/content";
import styles from "./RichText.module.css";

const SAFE_LINK_PROTOCOLS = new Set(["https:", "http:", "mailto:"]);

function safeHref(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) return null;
  try {
    const url = new URL(value, "https://axrock.band");
    return SAFE_LINK_PROTOCOLS.has(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function safeImageSrc(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) return null;
  if (value.startsWith("/")) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function applyMarks(text: string, marks: RichTextMark[] | undefined, key: string): ReactNode {
  if (!marks || marks.length === 0) return text;

  return marks.reduce<ReactNode>((content, mark, index) => {
    const markKey = `${key}-m${index}`;
    switch (mark.type) {
      case "bold":
        return <strong key={markKey}>{content}</strong>;
      case "italic":
      case "em":
        return <em key={markKey}>{content}</em>;
      case "underline":
        return <u key={markKey}>{content}</u>;
      case "strike":
        return <s key={markKey}>{content}</s>;
      case "code":
        return <code key={markKey}>{content}</code>;
      case "link": {
        const href = safeHref(mark.attrs?.href);
        if (!href) return content;
        const isExternal = !href.startsWith("/");
        return (
          <a
            key={markKey}
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
          >
            {content}
          </a>
        );
      }
      default:
        return content;
    }
  }, text);
}

function renderNodes(nodes: RichTextNode[] | undefined, keyPrefix: string): ReactNode[] {
  if (!nodes) return [];
  return nodes.map((node, index) => renderNode(node, `${keyPrefix}-${index}`));
}

function renderNode(node: RichTextNode, key: string): ReactNode {
  switch (node.type) {
    case "text":
      return <Fragment key={key}>{applyMarks(node.text ?? "", node.marks, key)}</Fragment>;

    case "paragraph":
      return <p key={key}>{renderNodes(node.content, key)}</p>;

    case "heading": {
      const level = Number(node.attrs?.level ?? 2);
      const Heading = level <= 2 ? "h2" : level === 3 ? "h3" : "h4";
      return <Heading key={key}>{renderNodes(node.content, key)}</Heading>;
    }

    case "bulletList":
      return <ul key={key}>{renderNodes(node.content, key)}</ul>;

    case "orderedList":
      return <ol key={key}>{renderNodes(node.content, key)}</ol>;

    case "listItem":
      return <li key={key}>{renderNodes(node.content, key)}</li>;

    case "blockquote":
      return <blockquote key={key}>{renderNodes(node.content, key)}</blockquote>;

    case "horizontalRule":
      return <hr key={key} />;

    case "hardBreak":
      return <br key={key} />;

    case "codeBlock":
      return (
        <pre key={key}>
          <code>{renderNodes(node.content, key)}</code>
        </pre>
      );

    case "image": {
      const src = safeImageSrc(node.attrs?.src);
      if (!src) return null;
      const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
      const caption = typeof node.attrs?.title === "string" ? node.attrs.title : null;
      return (
        <figure key={key}>
          <img src={src} alt={alt} loading="lazy" decoding="async" />
          {caption ? <figcaption>{caption}</figcaption> : null}
        </figure>
      );
    }

    default:
      return node.content ? <Fragment key={key}>{renderNodes(node.content, key)}</Fragment> : null;
  }
}

/**
 * Рендерит TipTap-документ в React-элементы по allowlist типов узлов.
 * HTML из бэкенда не вставляется — dangerouslySetInnerHTML не используется.
 */
export function RichText({ doc, className }: { doc: RichTextDoc | null; className?: string }) {
  if (!doc || doc.content.length === 0) return null;

  return (
    <div className={[styles.prose, className].filter(Boolean).join(" ")}>
      {renderNodes(doc.content, "n")}
    </div>
  );
}
