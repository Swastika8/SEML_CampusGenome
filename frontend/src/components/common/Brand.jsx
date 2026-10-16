import { Dna } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function Brand() {
  return (
    <Link className="brand" to="/" aria-label="CampusGenome home">
      <span className="brand-mark">
        <Dna size={26} strokeWidth={1.7} />
      </span>
      <span>
        campus<span className="brand-light">genome</span>
        <small>THE STUDENT COLLECTIVE</small>
      </span>
    </Link>
  );
}
