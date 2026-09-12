import SimpleMap from "../components/SimpleMap"

const TestMap = () => {
  return (
    <div className="p-8 min-h-screen bg-[#f5f7fb]">
      <h1 className="text-2xl font-bold mb-4">Test Map</h1>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <SimpleMap />
      </div>
    </div>
  )
}

export default TestMap