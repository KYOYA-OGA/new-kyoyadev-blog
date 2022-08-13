import FormInput from './FormInput';

export default function ContactForm() {
  return (
    <form className="max-w-xl mx-auto ">
      <div className="space-y-5">
        <FormInput label="Name" name="name" placeholder="お名前" />
        <FormInput label="Email" name="email" placeholder="メールアドレス" />
        <FormInput
          label="Message"
          name="message"
          placeholder="メッセージをどうぞ..."
          textarea
        />{' '}
      </div>
      <div className="mt-10">
        <button
          type="submit"
          className="bg-blue-500 block w-full text-center text-white py-2 px-5 rounded-lg transition hover:brightness-110 focus:brightness-110"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
