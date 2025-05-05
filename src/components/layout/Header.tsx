import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react'; // Use UserPlus for adding profile

interface HeaderProps {
  title: string;
  showAddButton?: boolean;
}

export function Header({ title, showAddButton = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
      <h1 className="text-xl font-semibold grow">{title}</h1>
      {showAddButton && (
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link href="/profiles/add">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Profile</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </Button>
      )}
    </header>
  );
}
