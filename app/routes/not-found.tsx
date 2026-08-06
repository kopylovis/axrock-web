import { data } from "react-router";

export async function clientLoader() {
  throw data("Страница не найдена", { status: 404 });
}

export default function NotFound() {
  return null;
}
