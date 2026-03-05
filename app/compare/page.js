import { redirect } from 'next/navigation';

export default function CompareCompatPage() {
  redirect('/tools?tool=compare');
}
