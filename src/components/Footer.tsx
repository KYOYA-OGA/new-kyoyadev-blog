import Container from './Container';
import SocialIcons from './SocialIcons';

export default function Footer() {
  return (
    <footer className="dark:bg-secondary bg-slate-100">
      <Container>
        <div className="text-center py-5 space-y-5 lg:py-7">
          <SocialIcons />
          {/* <div className="flex items-center justify-center">
            <p>
              お問い合わせは
              <a
                href="/contact"
                className="font-semibold text-blue-400 hover:text-success"
              >
                こちら
              </a>
              からお願いします。
            </p>
          </div> */}
          <p>© {new Date().getFullYear()} KyoyaDev Blog</p>
        </div>
      </Container>
    </footer>
  );
}
