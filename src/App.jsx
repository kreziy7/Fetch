import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [favorites, setFavorites] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editNotes, setEditNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    const { data, error } = await supabase
      .from('weather_favorites')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setFavorites(data || [])
  }

  const fetchWeather = async (cityName) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=your_api_key&units=metric`
      )

      if (!response.ok) {
        if (cityName.toLowerCase().includes('tashkent') || cityName.toLowerCase().includes('toshkent')) {
          setWeather({
            name: 'Tashkent',
            country: 'UZ',
            temp: -1,
            feels_like: -5,
            humidity: 92,
            wind_speed: 1.8,
            wind_deg: 110,
            pressure: 1039,
            visibility: 600,
            weather: 'Fog',
            description: 'Qalin tuman',
            icon: '50d',
            sunrise: '07:48',
            sunset: '17:18',
          })
        } else {
          setWeather({
            name: cityName,
            country: 'XX',
            temp: 24,
            feels_like: 23,
            humidity: 55,
            wind_speed: 5.2,
            wind_deg: 200,
            pressure: 1012,
            visibility: 10000,
            weather: 'Clear',
            description: 'Ochiq osmon',
            icon: '01d',
            sunrise: '06:15',
            sunset: '19:30',
          })
        }
      } else {
        const data = await response.json()
        setWeather({
          name: data.name,
          country: data.sys.country,
          temp: Math.round(data.main.temp),
          feels_like: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          wind_speed: data.wind.speed,
          wind_deg: data.wind.deg || 0,
          pressure: data.main.pressure,
          visibility: data.visibility,
          weather: data.weather[0].main,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
          sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        })
      }
    } catch (err) {
      setError('Internet aloqasi yoʼq. Demo maʼlumotlar.')
      setWeather({
        name: 'Tashkent',
        country: 'UZ',
        temp: 0,
        feels_like: -4,
        humidity: 90,
        wind_speed: 2,
        wind_deg: 90,
        pressure: 1035,
        visibility: 1000,
        weather: 'Clouds',
        description: 'Bulutli',
        icon: '04d',
        sunrise: '07:50',
        sunset: '17:20',
      })
    }
    setLoading(false)
  }

  const WeatherIcon = ({ icon }) => (
    <img
      src={`https://openweathermap.org/img/wn/${icon}@4x.png`}
      alt="weather"
      className="w-48 h-48 md:w-64 md:h-64 mx-auto drop-shadow-2xl"
    />
  )

  const getWindDirection = (deg) => {
    const dirs = ['Shimol', 'Shimoli-sharq', 'Sharq', 'Janubi-sharq', 'Janub', 'Janubi-gʻarb', 'Gʻarb', 'Shimoli-gʻarb']
    return dirs[Math.round(deg / 45) % 8]
  }

  const getBackground = () => {
    if (!weather) return 'from-slate-900 via-indigo-900 to-purple-900'
    const w = weather.weather.toLowerCase()
    if (w.includes('clear')) return 'from-cyan-700 via-blue-800 to-indigo-900'
    if (w.includes('cloud')) return 'from-gray-700 via-gray-800 to-slate-900'
    if (w.includes('rain')) return 'from-slate-800 via-indigo-900 to-gray-900'
    if (w.includes('snow')) return 'from-gray-600 via-blue-400 to-gray-700'
    if (w.includes('fog')) return 'from-gray-800 via-gray-900 to-black'
    if (w.includes('thunder')) return 'from-purple-900 via-black to-indigo-950'
    return 'from-slate-900 via-indigo-900 to-purple-900'
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (city.trim()) fetchWeather(city)
  }

  const addToFavorites = async () => {
    if (!weather) return
    const { error } = await supabase.from('weather_favorites').insert([{
      city_name: weather.name,
      country: weather.country,
      latitude: weather.lat || 0,
      longitude: weather.lon || 0,
      notes: ''
    }])
    if (!error) fetchFavorites()
  }

  const updateFavorite = async (id, notes) => {
    const { error } = await supabase.from('weather_favorites')
      .update({ notes, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) {
      fetchFavorites()
      setEditingId(null)
      setEditNotes('')
    }
  }

  const deleteFavorite = async (id) => {
    const { error } = await supabase.from('weather_favorites').delete().eq('id', id)
    if (!error) fetchFavorites()
  }

  const loadFavorite = (favorite) => {
    setCity(favorite.city_name)
    fetchWeather(favorite.city_name)
  }

  return (
    <div className={`min-h-screen w-full bg-gradient-to-br ${getBackground()} transition-all duration-1000 flex flex-col`}>
      {/* Header - Qidiruv */}
      <header className="w-full bg-black/20 backdrop-blur-xl py-8 px-6 shadow-2xl">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white text-center mb-8 drop-shadow-2xl">
            Ob-Havo
          </h1>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Shahar nomi kiriting... (Tashkent, London, Dubai)"
              className="flex-1 px-6 py-4 text-lg bg-white/20 border border-white/30 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-2xl transition shadow-lg disabled:opacity-60"
            >
              {loading ? 'Yuklanmoqda...' : 'Qidirish'}
            </button>
          </form>
          {error && <p className="text-yellow-300 text-center mt-4 text-lg">{error}</p>}
        </div>
      </header>

      {/* Asosiy kontent - Full height */}
      <main className="flex-1 flex flex-col lg:flex-row gap-8 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {/* Joriy ob-havo */}
        {weather && (
          <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 flex flex-col">
            <div className="text-center flex-1 flex flex-col justify-center">
              <WeatherIcon icon={weather.icon} />
              <h2 className="text-4xl md:text-6xl font-bold text-white mt-8">
                {weather.name}, {weather.country}
              </h2>
              <p className="text-2xl md:text-3xl text-blue-200 capitalize mt-4">
                {weather.description}
              </p>
              <div className="text-8xl md:text-9xl font-extrabold text-white my-10">
                {weather.temp}°C
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
                <p className="text-blue-200 mb-2">His qilish</p>
                <p className="text-3xl font-bold text-white">{weather.feels_like}°C</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
                <p className="text-blue-200 mb-2">Namlik</p>
                <p className="text-3xl font-bold text-white">{weather.humidity}%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
                <p className="text-blue-200 mb-2">Shamol</p>
                <p className="text-3xl font-bold text-white">{weather.wind_speed} m/s</p>
                <p className="text-blue-100 text-lg mt-1">{getWindDirection(weather.wind_deg)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
                <p className="text-blue-200 mb-2">Bosim</p>
                <p className="text-3xl font-bold text-white">{weather.pressure} hPa</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-8">
              <div className="bg-white/10 rounded-2xl p-6 text-center">
                <p className="text-blue-200 mb-2">Ko'rinish</p>
                <p className="text-2xl font-bold text-white">{(weather.visibility / 1000).toFixed(1)} km</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-6 text-center">
                <p className="text-blue-200 mb-2">Quyosh chiqishi</p>
                <p className="text-2xl font-bold text-white">{weather.sunrise}</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-6 text-center">
                <p className="text-blue-200 mb-2">Quyosh botishi</p>
                <p className="text-2xl font-bold text-white">{weather.sunset}</p>
              </div>
            </div>

            <button
              onClick={addToFavorites}
              className="mt-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-2xl font-bold rounded-2xl shadow-xl transition transform hover:scale-105"
            >
              ⭐ Sevimlilarga Qo'shish
            </button>
          </div>
        )}

        {/* Sevimlilar */}
        <aside className="w-full lg:w-96 bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            Sevimli Shaharlar
          </h3>

          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">🌍</div>
              <p className="text-2xl text-blue-200">Hozircha sevimli shahar yo'q</p>
            </div>
          ) : (
            <div className="space-y-5 max-h-96 overflow-y-auto pr-2">
              {favorites.map((fav) => (
                <div key={fav.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-2xl font-bold text-white">{fav.city_name}</h4>
                      <p className="text-blue-200 text-lg">{fav.country}</p>
                    </div>
                    <button
                      onClick={() => loadFavorite(fav)}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition"
                    >
                      Ko'rish
                    </button>
                  </div>

                  {editingId === fav.id ? (
                    <div className="space-y-4 mt-4">
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="w-full px-5 py-4 bg-white/20 rounded-xl text-white placeholder-blue-200"
                        rows="3"
                        placeholder="Izoh yozing..."
                      />
                      <div className="flex gap-3">
                        <button onClick={() => updateFavorite(fav.id, editNotes)} className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-xl">
                          Saqlash
                        </button>
                        <button onClick={() => { setEditingId(null); setEditNotes('') }} className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl">
                          Bekor qilish
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {fav.notes && <p className="text-blue-100 italic mt-4">{fav.notes}</p>}
                      <div className="flex gap-3 mt-5">
                        <button onClick={() => { setEditingId(fav.id); setEditNotes(fav.notes || '') }} className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-xl">
                          Izoh tahrirlash
                        </button>
                        <button onClick={() => deleteFavorite(fav.id)} className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-xl">
                          O'chirish
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}

export default App