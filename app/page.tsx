import { getUser } from '@/lib/supabse/server';
import React from 'react';

export default async function Hompage() {
  const currentUser = await getUser();
  //console.log(currentUser);
  return (
    <div>
      <h2>Hompage</h2>
    </div>
  );
}
