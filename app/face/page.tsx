import { getUser } from '@/lib/supabse/server';
import React from 'react';
import FaceAnalyzer from './FaceAnalyzer';

export default async function FacePage() {
  const currentUser = await getUser();
  const currentUser_id = currentUser?.id;

  //console.log(newUserCheck);

  return (
    <div className="pb-16 relative">
      <FaceAnalyzer currentUser_id={currentUser_id} />
    </div>
  );
}
