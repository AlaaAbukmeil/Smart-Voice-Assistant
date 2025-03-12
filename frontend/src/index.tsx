function MyButton({ title }: { title: string }) {
  return (
    <button>{title}</button>
  );
}

export default function MyApp() {
  return (
    <div>
      <h1>Smart Voice Assistant</h1>
      <MyButton title="Press me to start recording" />
    </div>
  );
}