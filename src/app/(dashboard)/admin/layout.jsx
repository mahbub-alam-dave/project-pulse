// import { cookies } from 'next/headers';
import Sidebar from '../../../components/admin/Sidebar'
import { getCurrentUser } from '../../../lib/authClient';


export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();
  console.log(user)

  // const token = await cookies().get('auth_token')?.value;

  // if (!token) {
  //   redirect('/login');
  // }

  // const decoded = verifyToken(token);

  // if (!decoded) {
  //   redirect('/login');
  // }

  // if (decoded.role !== 'admin') {
  //   redirect(`/${decoded.role}`);
  // }


  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 ml-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}