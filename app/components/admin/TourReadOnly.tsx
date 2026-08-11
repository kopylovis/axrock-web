import { useEffect, useState } from "react";
import { getSetlist, type Setlist, type TourConcert, type TourDetail } from "~/api/admin-api";
import { GlassPanel } from "~/components/common/GlassPanel";
import { parseUtcSafe } from "~/utils/admin-format";
import { formatDate, formatDateTime } from "~/utils/format";
import { LOGISTICS_LABELS, formatSetlistTotal } from "~/utils/crew-format";
import styles from "./admin.module.css";

/**
 * Просмотр выезда для музыканта: править он ничего не может, но должен видеть
 * логистику по дням и программу каждого концерта. Раздел «Концерты» ему закрыт,
 * поэтому сет-листы показываются здесь — иначе до них не добраться.
 */
export function TourReadOnly({ tour }: { tour: TourDetail }) {
  const byDay = new Map<string, typeof tour.logistics>();
  for (const item of tour.logistics) {
    const day = item.happensOn.slice(0, 10);
    byDay.set(day, [...(byDay.get(day) ?? []), item]);
  }

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>{tour.title}</h1>
      </div>

      {tour.startsOn || tour.endsOn ? (
        <p className={styles.pageNote}>
          {[tour.startsOn, tour.endsOn]
            .filter(Boolean)
            .map((value) => formatDate(parseUtcSafe(value)))
            .join(" — ")}
        </p>
      ) : null}

      {tour.notes ? (
        <GlassPanel className={styles.panel}>
          <h2 className={styles.panelTitle}>Заметки</h2>
          <p className={styles.readText}>{tour.notes}</p>
        </GlassPanel>
      ) : null}

      <GlassPanel className={styles.panel}>
        <h2 className={styles.panelTitle}>Логистика</h2>
        {byDay.size === 0 ? (
          <p className={styles.hint}>Пока не заполнена.</p>
        ) : (
          [...byDay.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([day, items]) => (
              <div key={day} className={styles.logisticsDay}>
                <h3 className={styles.logisticsDate}>{formatDate(parseUtcSafe(day))}</h3>
                <ul className={styles.plainList}>
                  {items.map((item) => (
                    <li key={item.id} className={styles.logisticsItem}>
                      <span className={styles.logisticsTime}>{item.timeLabel ?? "—"}</span>
                      <span>
                        <span className={styles.rowTitle}>{item.title}</span>
                        {item.kind !== "OTHER" ? (
                          <span className={styles.rowNote}> {LOGISTICS_LABELS[item.kind]}</span>
                        ) : null}
                        {item.participants.length > 0 ? (
                          <div className={styles.hint}>{item.participants.join(", ")}</div>
                        ) : null}
                        {item.details ? <div className={styles.readText}>{item.details}</div> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
        )}
      </GlassPanel>

      {tour.concerts.map((concert) => (
        <ConcertSetlist key={concert.id} concert={concert} />
      ))}
    </>
  );
}

function ConcertSetlist({ concert }: { concert: TourConcert }) {
  const [setlist, setSetlist] = useState<Setlist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getSetlist(concert.id)
      .then((data) => {
        if (!cancelled) setSetlist(data);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [concert.id]);

  return (
    <GlassPanel className={styles.panel}>
      <h2 className={styles.panelTitle}>
        {concert.city} — {concert.venueName}
      </h2>
      <p className={styles.panelTotal}>
        {formatDateTime(parseUtcSafe(concert.startsAt), concert.timezone)}
        {setlist && setlist.totalSeconds > 0
          ? ` · программа ${formatSetlistTotal(setlist.totalSeconds)}`
          : ""}
      </p>

      {loading ? <p className={styles.hint}>Загрузка сет-листа…</p> : null}

      {!loading && (!setlist || setlist.items.length === 0) ? (
        <p className={styles.hint}>Сет-лист пока не задан.</p>
      ) : null}

      {setlist && setlist.items.length > 0 ? (
        <ol className={styles.setlist}>
          {setlist.items.map((item) => (
            <li key={item.id}>
              <span className={styles.rowTitle}>{item.title}</span>
              {item.duration ? <span className={styles.rowNote}> {item.duration}</span> : null}
              {item.note ? <span className={styles.hint}> ({item.note})</span> : null}
              {item.backingTrackUrl ? (
                <>
                  {" "}
                  <a href={item.backingTrackUrl} target="_blank" rel="noreferrer">
                    минусовка
                  </a>
                </>
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}
    </GlassPanel>
  );
}
