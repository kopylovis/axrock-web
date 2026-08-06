import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { BlurBackground } from "~/components/common/BlurBackground";
import "./styles/global.css";

export const meta: Route.MetaFunction = () => [
  { title: "Ангел-Хранитель — официальный сайт группы" },
  {
    name: "description",
    content:
      "Официальный сайт рок-группы «Ангел-Хранитель»: новости, афиша концертов, дискография, фото и видео.",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0b0d14" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link
          rel="preload"
          href="/fonts/roboto-cyrillic.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/roboto-mono-cyrillic.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <BlurBackground />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  const title = notFound ? "Страница не найдена" : "Что-то пошло не так";
  const details = notFound
    ? "Возможно, страница была перемещена или ссылка устарела."
    : isRouteErrorResponse(error)
      ? error.statusText || "Непредвиденная ошибка."
      : "Непредвиденная ошибка. Попробуйте обновить страницу.";

  return (
    <main className="error-page">
      <div className="container error-page__inner">
        <p className="caps error-page__code">{notFound ? "404" : "Ошибка"}</p>
        <h1 className="display error-page__title">{title}</h1>
        <p className="error-page__text">{details}</p>
        <p>
          <Link to="/" className="error-page__action">
            На главную
          </Link>
        </p>
      </div>
    </main>
  );
}
