export default function Footer() {
  return (
    <footer className="bg-ink text-[#f5ecd799] px-5 md:px-[5%] py-12 flex flex-col md:flex-row justify-between items-center gap-6 mt-auto">
      <div className="font-serif text-2xl font-bold text-parchment">📚 BookNest</div>
      <ul className="flex flex-wrap justify-center gap-6 list-none">
        <li><a href="#" className="text-sm transition-colors hover:text-parchment">About</a></li>
        <li><a href="#" className="text-sm transition-colors hover:text-parchment">Privacy</a></li>
        <li><a href="#" className="text-sm transition-colors hover:text-parchment">Contact</a></li>
        <li><a href="/signin" className="text-sm transition-colors hover:text-parchment">Sign In</a></li>
      </ul>
      <p className="text-xs text-center">© 2026 BookNest · CUET A2-02</p>
    </footer>
  );
}