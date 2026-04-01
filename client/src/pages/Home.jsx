import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-cream min-h-screen">

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-10 py-24 flex items-center justify-between gap-16">

        {/* Left Content */}
        <div className="w-1/2 space-y-8">
          <h1 className="text-6xl font-heading text-midnight leading-tight">
            Healthy Choices.
            <br />
            <span className="text-gold">Delicious Taste.</span>
          </h1>

          <p className="text-lg text-midnight opacity-75 leading-relaxed">
            Discover meals tailored to your health goals. 
            Smart filtering, calorie tracking, and seamless group ordering — all in one place.
          </p>

          <button
            onClick={() => navigate("/menu")}
            className="bg-gold text-midnight px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Explore Menu
          </button>
        </div>

        {/* Right Image */}
        <div className="w-1/2">
          <img
            src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092"
            alt="Food"
            className="w-full rounded-2xl shadow-xl"
          />
        </div>

      </section>

      {/* GOLD DIVIDER */}
      <div className="max-w-6xl mx-auto px-10">
        <div className="h-1 w-24 bg-gold mb-16"></div>
      </div>

      {/* WHY CHOOSE US */}
      <section className="max-w-6xl mx-auto px-10 pb-20">

        <h2 className="text-4xl font-heading text-midnight mb-12">
          Why Choose <span className="text-gold">FoodieWeb</span>
        </h2>

        <div className="grid grid-cols-3 gap-10">

          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition">
            <h3 className="text-xl font-heading text-midnight mb-4">
              Health-Based Filtering
            </h3>
            <p className="text-midnight opacity-70 leading-relaxed">
              Filter meals based on calories, protein levels, and diet preferences to match your goals.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition">
            <h3 className="text-xl font-heading text-midnight mb-4">
              Group Ordering
            </h3>
            <p className="text-midnight opacity-70 leading-relaxed">
              Order together with friends and split bills effortlessly in just a few clicks.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition">
            <h3 className="text-xl font-heading text-midnight mb-4">
              Complaint Tracking
            </h3>
            <p className="text-midnight opacity-70 leading-relaxed">
              Raise issues and track their resolution status transparently and efficiently.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Home;