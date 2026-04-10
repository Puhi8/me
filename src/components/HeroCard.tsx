import type { CSSProperties } from 'react'
import { resolveIcon, toIconPath } from '../lib/projectUtils'
import { withBase } from '../lib/sitePaths'
import type { Badge, Connection } from '../types'

interface HeroCardProps {
  connections: Connection[]
  badges: Badge[]
}

export default function HeroCard({ connections, badges }: HeroCardProps) {
  return <section className="hero-card card">
    <div className="identity">
      <div className="avatar-wrap">
        <img
          src={withBase('/profile.png')}
          alt="Puhi8 profile"
          className="profile-photo"
        />
        <div className="glow" />
      </div>
      <div>
        <p className="eyebrow">Hello, it is I</p>
        <h1>Puhi8</h1>
        <p className="lede">Discovering as much as possible about computers while I&apos;m still alive.</p>
        <div className="connections">
          {connections.map(connection => {
            const iconPath = resolveIcon(connection.icon) || toIconPath(connection.label)
            return <a
              key={`${connection.label}-${connection.url}`}
              className="chip"
              href={connection.url}
              target="_blank"
              rel="noreferrer"
              aria-label={connection.label}
            >
              <span
                aria-hidden="true"
                className="connection-icon"
                style={{ '--connection-icon-mask': `url("${iconPath}")` } as CSSProperties}
              />
            </a>
          })}
        </div>
      </div>
    </div>
    <div className="badges">
      {badges.map(badge => <span
        key={badge.text}
        className={`pill ${badge.standOut ? 'accent' : 'outline'}`}
      >
        {badge.text}
      </span>
      )}
    </div>
  </section>
}
