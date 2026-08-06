import { ResponsiveImage } from "~/components/common/ResponsiveImage";
import { SocialLinks } from "~/components/layout/LinkLists";
import type { BandMember } from "~/types/content";
import styles from "./MemberCard.module.css";

export function MemberCard({ member }: { member: BandMember }) {
  return (
    <article className={styles.card}>
      <div className={styles.photoWrap}>
        <ResponsiveImage
          src={member.photo}
          spec="memberPhoto"
          alt={`${member.name} — ${member.role}`}
          className={styles.photo}
          sizes="(max-width: 720px) 100vw, 260px"
        />
        <span className={styles.roleOverlay}>{member.role}</span>
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{member.name}</h3>
        {member.stageName ? <p className={styles.stageName}>«{member.stageName}»</p> : null}
        {member.instrument ? <p className={styles.instrument}>{member.instrument}</p> : null}
        {member.biography ? <p className={styles.biography}>{member.biography}</p> : null}
        {member.links.length > 0 ? (
          <div className={styles.links}>
            <SocialLinks links={member.links} />
          </div>
        ) : null}
      </div>
    </article>
  );
}
