import { Link, useRevalidator } from "react-router";
import type { Route } from "./+types/members-list";
import { deleteMember, listMembers } from "~/api/admin-api";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { EmptyState, ErrorState } from "~/components/common/States";
import { RowMenu } from "~/components/admin/RowMenu";
import styles from "~/components/admin/admin.module.css";

export async function clientLoader() {
  try {
    return { members: await listMembers(), failed: false as const };
  } catch {
    return { members: [], failed: true as const };
  }
}

export function HydrateFallback() {
  return <PageSkeleton label="Загрузка участников" />;
}

export default function AdminMembersList({ loaderData }: Route.ComponentProps) {
  const { members, failed } = loaderData;
  const revalidator = useRevalidator();

  async function remove(id: number, name: string) {
    if (!window.confirm(`Удалить участника «${name}»?`)) return;
    await deleteMember(id);
    revalidator.revalidate();
  }

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Участники</h1>
        <div className={styles.pageActions}>
          <Link to="/admin/members/new" className={`${styles.btn} ${styles.btnPrimary}`}>
            + Участник
          </Link>
        </div>
      </div>

      {failed ? <ErrorState /> : null}

      {!failed && members.length === 0 ? (
        <EmptyState title="Состав не заполнен" description="Добавьте участников группы." />
      ) : null}

      {members.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Имя</th>
                <th>Роль</th>
                <th>Порядок</th>
                <th>Состав</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>
                    <Link to={`/admin/members/${member.id}`} className={styles.rowTitle}>
                      {member.name}
                    </Link>
                  </td>
                  <td>{member.role}</td>
                  <td>{member.sortOrder}</td>
                  <td>{member.currentMember ? "Текущий" : "Бывший"}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <Link
                        to={`/admin/members/${member.id}`}
                        className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                      >
                        Изменить
                      </Link>
                      <RowMenu
                        label={`Действия: ${member.name}`}
                        items={[
                          {
                            label: "Удалить",
                            danger: true,
                            onSelect: () => remove(member.id, member.name),
                          },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}
