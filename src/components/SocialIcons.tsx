import { BsGithub, BsLinkedin, BsTwitter } from 'react-icons/bs/index';

export default function SocialIcons() {
  return (
    <ul className="flex justify-center space-x-5 lg:space-x-7">
      <li>
        <a
          target="_blank"
          href="https://github.com/kyoya-oga"
          className="hover:opacity-80 transition-opacity"
        >
          <BsGithub size={24} />
          <span className="sr-only">GitHub</span>
        </a>
      </li>
      <li>
        <a
          target="_blank"
          href="https://twitter.com/gasamobile1"
          className="hover:opacity-80 transition-opacity"
        >
          <BsTwitter size={24} />
          <span className="sr-only">Twitter</span>
        </a>
      </li>
      <li>
        <a
          target="_blank"
          href="https://th.linkedin.com/in/kyoya-oga"
          className="hover:opacity-80 transition-opacity"
        >
          <BsLinkedin size={24} />
          <span className="sr-only">Instagram</span>
        </a>
      </li>
    </ul>
  );
}
