import { Link, useRevalidator } from "react-router";
import type { Route } from "./+types/members-list";
import { deleteMember, listMembers } from "~/api/admin-api";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { EmptyState, ErrorState } from "~/components/common/States";
import { RowMenu } from "~/components/admin/RowMenu";
import { SortableTh, compareValues, useTableSort } from "~/components/admin/sortable-table";
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
  const { sort, toggle } = useTableSort<"name" | "role" | "order" | "current">({ key: "order", direction: "asc" });

  // Сортировка идёт по данным, а не по разметке: значения берутся из записи.
  const sorted = [...members].sort((a, b) => {
      if (sort.key === "name") return compareValues(a.name, b.name, sort.direction);
      if (sort.key === "role") return compareValues(a.role, b.role, sort.direction);
      if (sort.key === "order") return compareValues(a.sortOrder, b.sortOrder, sort.direction);
      if (sort.key === "current") return compareValues(a.currentMember ? 1 : 0, b.currentMember ? 1 : 0, sort.direction);
      return 0;
  });
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
                <SortableTh
                      label="Имя"
                      sortKey="name"
                      sort={sort}
                      onSort={toggle}
                    />
                <SortableTh
                      label="Роль"
                      sortKey="role"
                      sort={sort}
                      onSort={toggle}
                    />
                <SortableTh
                      label="Порядок"
                      sortKey="order"
                      sort={sort}
                      onSort={toggle}
                    />
                <SortableTh
                      label="Состав"
                      sortKey="current"
                      sort={sort}
                      onSort={toggle}
                      preferred="desc"
                    />
                <th />
              </tr>
            </thead>
            <tbody>
              {sorted.map((member) => (
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
