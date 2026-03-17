import type { Organization, OrgCategory } from '../types';

const BADGE_COLORS: Record<OrgCategory, string> = {
  reuse: '#1871BD',
  repair: '#091F2F',
  food: '#2E7D32',
  clothing: '#7B3FA0',
  share: '#E65100',
  reduce: '#FB4D42',
};

interface OrgCardProps {
  org: Organization;
}

export default function OrgCard({ org }: OrgCardProps) {
  return (
    <div className="org-card">
      <span
        className="org-card__badge"
        style={{ backgroundColor: BADGE_COLORS[org.category] }}
      >
        {org.category}
      </span>
      <p className="org-card__name">{org.name}</p>
      <p className="org-card__address">{org.address}</p>
      <p className="org-card__description">{org.description}</p>
      {org.website && (
        <a
          className="org-card__link"
          href={org.website}
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit website →
        </a>
      )}
    </div>
  );
}
