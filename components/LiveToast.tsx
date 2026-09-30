'use client';

import { useEffect, useState } from 'react';

const PEOPLE = [
  { name: 'Priya', city: 'Bangalore', action: 'joined the waitlist' },
  { name: 'Kenji', city: 'Tokyo', action: 'secured a spot' },
  { name: 'Noah', city: 'Toronto', action: 'just signed up' },
  { name: 'Sara', city: 'Berlin', action: 'joined the waitlist' },
  { name: 'Arjun', city: 'Mumbai', action: 'secured a spot' },
  { name: 'Mei', city: 'Singapore', action: 'just signed up' },
];

export function LiveToast() {
  const [visible, setVisible] = useState(false);
  const [person, setPerson] = useState(PEOPLE[0]);

  useEffect(() => {
    function showToast() {
      const p = PEOPLE[Math.floor(Math.random() * PEOPLE.length)];
      setPerson(p);
      setVisible(true);
      setTimeout(() => setVisible(false), 3500);
    }

    const delay = setTimeout(showToast, 2000);
    const interval = setInterval(showToast, 8000);
    return () => { clearTimeout(delay); clearInterval(interval); };
  }, []);

  if (!visible) return null;

  const initials = person.name.slice(0, 1);
  const colors = ['#F3568A', '#77B79D', '#5A76DA', '#F3B267', '#ED797B', '#9B77DA'];
  const color = colors[PEOPLE.indexOf(PEOPLE.find(p => p.name === person.name)!) % colors.length];

  return (
    <div className="waitlist-toast" role="status" aria-live="polite">
      <div className="toast-avatar" style={{ background: color }}>
        {initials}
        <span className="toast-green-dot" />
      </div>
      <div>
        <div className="toast-info-name">{person.name} from {person.city}</div>
        <div className="toast-info-status">{person.action} · just now</div>
      </div>
    </div>
  );
}
