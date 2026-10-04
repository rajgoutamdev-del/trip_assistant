import { Compass } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <EmptyState
        as="h1"
        icon={<Compass size={22} />}
        title="Nothing at this address"
        description="The page you were looking for does not exist in this build."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <ButtonLink to="/dashboard">Go to dashboard</ButtonLink>
            <ButtonLink to="/explore" variant="outline">
              Explore India
            </ButtonLink>
          </div>
        }
      />
    </div>
  );
}
