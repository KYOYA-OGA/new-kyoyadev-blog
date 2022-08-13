import Container from './Container';
import SocialIcons from './SocialIcons';

export default function Footer() {
  return (
    <footer className="bg-secondary text-soft-white">
      <Container>
        <div className="text-center py-5 space-y-5 lg:py-7">
          <SocialIcons />
          <p>© {new Date().getFullYear()} KyoyaDev Blog</p>
        </div>
      </Container>
    </footer>
  );
}
