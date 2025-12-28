
import EmployeeSidebar from '../../../components/employee/Sidebar';
import { getCurrentUser } from '../../../lib/authClient';

export default async function EmployeeLayout({ children }) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <EmployeeSidebar user={user} />
      <main className="flex-1 ml-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}