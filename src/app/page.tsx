import { ColorPicker } from "@/components/color-picker"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Emoji Color Picker</h1>
        <ColorPicker />
      </div>
    </main>
  )
}

