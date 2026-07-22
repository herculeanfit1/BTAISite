import { redirect } from "next/navigation";

/**
 * /about has never been a standalone page — the About content is a section of
 * the single-page homepage. It resolved with a 200 only because the [locale]
 * segment matched any path and served the homepage; once that was constrained
 * it would have started 404ing, breaking any existing inbound link.
 *
 * Redirect to the real anchor instead of dead-ending. Deliberately not listed
 * in sitemap.xml — sitemaps should carry destinations, not redirects.
 */
export default function AboutRedirect() {
  redirect("/#about");
}
