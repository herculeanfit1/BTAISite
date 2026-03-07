'use client';

export function ManageCookiesButton() {
  const handleClick = () => {
    document.cookie = 'btai_consent=; path=/; max-age=0';
    window.location.reload();
  };

  return (
    <button
      onClick={handleClick}
      className="text-[#5B90B0] dark:text-[#7BA8C4] underline hover:no-underline text-sm"
    >
      Manage cookie preferences
    </button>
  );
}
