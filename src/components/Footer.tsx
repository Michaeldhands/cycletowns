import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <div className="ctfooter">
      <div className="in">
        <div className="ftcols">
          <div className="ftbrand">
            <div className="ftlogo">
              <Logo h={36} />
            </div>
            <p>
              Made by cyclists, for cyclists. The discovery hub for cycle tourism — every town ranked by the riders who
              actually rode it.
            </p>
            <div className="ftsoc">
              <a href="https://www.instagram.com/cycletowns" target="_blank" rel="noopener" title="Instagram @cycletowns">
                📷
              </a>
              <a href="https://www.youtube.com/@cycletownshq" target="_blank" rel="noopener" title="YouTube @cycletownshq">
                ▶
              </a>
              <a href="https://www.linkedin.com/company/cycletowns/" target="_blank" rel="noopener" title="LinkedIn">
                in
              </a>
            </div>
          </div>
          <div className="ftcol">
            <h4>Explore</h4>
            <Link href="/towns">Towns</Link>
            <Link href="/rankings">Rankings</Link>
            <Link href="/news">News</Link>
            <Link href="/shop">Shop</Link>
            <Link href="/plan">Plan a trip</Link>
            <Link href="/loop">Build a loop</Link>
          </div>
          <div className="ftcol">
            <h4>Riders</h4>
            <Link href="/join">Join the bunch</Link>
            <Link href="/feed">The feed</Link>
            <Link href="/membership">Membership &amp; rewards</Link>
            <Link href="/offers">Member offers</Link>
            <Link href="/creators">Become a creator</Link>
            <Link href="/login">Log in</Link>
          </div>
          <div className="ftcol">
            <h4>For partners</h4>
            <Link href="/partners">Become a partner</Link>
            <Link href="/partners#cafe">Cafés &amp; bike shops</Link>
            <Link href="/partners#stay">Stays &amp; hotels</Link>
            <Link href="/partners#brand">Brands &amp; tourism boards</Link>
            <Link href="/partners#enquire">Advertise with us</Link>
          </div>
          <div className="ftcol">
            <h4>Company</h4>
            <Link href="/about">About us</Link>
            <Link href="/how-rankings-work">How rankings work</Link>
            <Link href="/careers">Careers</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div className="ftbar">
          <div className="ftcopy">© {year} Cycletowns™ · Made by cyclists, for cyclists</div>
          <div className="ftlegal">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/image-credits">Image credits</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
