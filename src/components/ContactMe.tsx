import { AiOutlineFileText, AiOutlineMail } from 'react-icons/ai/index';

export default function ContactMe() {
  return (
    <div className="space-y-3">
      <div>
        <a
          target="_blank"
          href="/static/kyoya-resume.pdf"
          className="dark:text-soft-white flex items-center justify-center space-x-1"
        >
          <AiOutlineFileText size={24} />
          <span>Resume</span>
        </a>
      </div>
      <div className="flex items-center justify-center space-x-1">
        <a href="mailto:contact@kyoyaoga.dev">
          <AiOutlineMail size={24} />
        </a>
        <span className="pb-0.5">contact@kyoyaoga.dev</span>
      </div>
    </div>
  );
}
