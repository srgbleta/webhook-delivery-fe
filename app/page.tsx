import { WebhookForm } from "./components/WebhookForm";
import { WebhooksList } from "./components/WebhooksList";

export default function Home() {
  return (
    <div className="grid min-h-screen grid-cols-1 gap-6 md:grid-cols-2">
      <WebhookForm />
      <WebhooksList />
    </div>
  );
}
