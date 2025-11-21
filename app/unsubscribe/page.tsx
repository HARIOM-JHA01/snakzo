import React from 'react';
import UnsubscribeForm from '@/components/unsubscribe/unsubscribe-form';

export default function Page() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <UnsubscribeForm />
    </React.Suspense>
  );
}
