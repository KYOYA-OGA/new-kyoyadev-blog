import githubIcon from '@images/icons/iconmonstr-github-1.svg';
import linkedinIcon from '@images/icons/iconmonstr-linkedin-3.svg';
import twitterIcon from '@images/icons/iconmonstr-twitter-4.svg';

export default function SocialIcons() {
  return (
    <ul className="flex justify-center space-x-5 lg:space-x-7">
      <li>
        <a href="" className="hover:opacity-80 transition-opacity">
          <img src={githubIcon} alt="github" />
        </a>
      </li>
      <li>
        <a href="" className="hover:opacity-80 transition-opacity">
          <img src={twitterIcon} alt="github" />
        </a>
      </li>
      <li>
        <a href="" className="hover:opacity-80 transition-opacity">
          <img src={linkedinIcon} alt="github" />
        </a>
      </li>
    </ul>
  );
}
