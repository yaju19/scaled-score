// app/page.tsx
import HookFormPOC from "./Components/HookFormPOC";

const Home: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl mb-4">Configurable scaled score POC</h1>
      <HookFormPOC />
    </div>
  );
};

export default Home;
