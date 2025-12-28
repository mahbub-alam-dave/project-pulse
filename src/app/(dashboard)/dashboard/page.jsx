import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {verifyToken} from "../../../lib/auth"
import React from 'react';

const page = async () => {
       const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

      console.log("This is from dashboard",token)

  if (!token) {
    redirect('/login');
  }

  const decoded = await verifyToken(token);

  if (!decoded) {
    redirect('/login');
  }

  if (decoded.role !== 'admin') {
    redirect(`/${decoded.role}`);
  }
    return (
        <div>
            this is dashboard page
        </div>
    );
};

export default page;