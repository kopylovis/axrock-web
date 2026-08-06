import { Link } from "react-router";
import type { Route } from "./+types/personal-data-consent";
import { useSiteData } from "~/layouts/PublicLayout";
import { buildMeta } from "~/lib/seo";
import styles from "~/styles/page.module.css";

export function meta({ location }: Route.MetaArgs) {
  return buildMeta({
    title: "Согласие на обработку персональных данных",
    description:
      "Условия согласия на обработку персональных данных на официальном сайте группы «Ангел-Хранитель».",
    pathname: location.pathname,
  });
}

export default function PersonalDataConsent() {
  const { settings } = useSiteData();
  const contact = settings.contactEmail ?? settings.bookingEmail;

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <span className={styles.eyebrow}>Правовая информация</span>
          <h1 className={styles.title}>Согласие на обработку персональных данных</h1>
        </header>

        <div className={styles.prose}>
          <h2>Предмет согласия</h2>
          <p>
            Направляя обращение по указанным на сайте контактам, вы даёте согласие на обработку
            персональных данных, содержащихся в вашем сообщении, в объёме, необходимом для ответа на
            обращение.
          </p>

          <h2>Состав данных</h2>
          <ul>
            <li>имя или псевдоним, которым вы подписались;</li>
            <li>адрес электронной почты или иной указанный вами контакт;</li>
            <li>содержание вашего обращения.</li>
          </ul>

          <h2>Цели обработки</h2>
          <p>
            Данные обрабатываются исключительно для рассмотрения обращения, подготовки ответа и, при
            необходимости, согласования условий концертного или информационного сотрудничества.
          </p>

          <h2>Действия с данными</h2>
          <p>
            Обработка включает сбор, запись, хранение, уточнение, использование и удаление данных.
            Автоматизированное принятие решений на основании ваших данных не осуществляется.
          </p>

          <h2>Срок действия и отзыв</h2>
          <p>
            Согласие действует до достижения целей обработки либо до его отзыва. Отозвать согласие
            можно в любой момент, направив соответствующее сообщение
            {contact ? (
              <>
                {" "}
                на <a href={`mailto:${contact}`}>{contact}</a>
              </>
            ) : null}
            . После отзыва данные удаляются, если нет иных законных оснований для их хранения.
          </p>

          <h2>Связанные документы</h2>
          <p>
            Подробные условия обработки описаны в{" "}
            <Link to="/privacy">политике конфиденциальности</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
