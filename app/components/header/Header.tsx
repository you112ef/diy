import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { toggleMenu } from '~/lib/stores/menu'; // Import toggleMenu
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';

export function Header() {
  const chat = useStore(chatStore);

  return (
    <header
      className={classNames(
        'flex items-center p-3 sm:p-5 border-b h-[var(--header-height)] justify-between sm:justify-start', // Adjusted padding and justification
        {
          'border-transparent': !chat.started,
          'border-bolt-elements-borderColor': chat.started,
        },
      )}
    >
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={toggleMenu}
        className="p-2 rounded-md sm:hidden text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-500"
        aria-label="Toggle menu"
      >
        <div className="i-ph:list-bold text-2xl" />
      </button>

      {/* Existing Logo and optional desktop sidebar icon (now hidden on mobile) */}
      <div className="hidden sm:flex items-center gap-2 z-logo text-bolt-elements-textPrimary cursor-pointer">
        <div className="i-ph:sidebar-simple-duotone text-xl" /> {/* This could be a desktop-only affordance if needed */}
        <a href="/" className="text-2xl font-semibold text-accent flex items-center">
          {/* <span className="i-bolt:logo-text?mask w-[46px] inline-block" /> */}
          <img src="/logo-light-styled.png" alt="logo" className="w-[90px] inline-block dark:hidden" />
          <img src="/logo-dark-styled.png" alt="logo" className="w-[90px] inline-block hidden dark:block" />
        </a>
      </div>

      {/* Spacer to push ChatDescription and HeaderActionButtons to center/right on mobile when logo is hidden */}
      {/* This might need adjustment depending on desired mobile layout when chat.started is true */}
      <div className="sm:hidden flex-1"></div>


      {chat.started && ( // Display ChatDescription and HeaderActionButtons only when the chat has started.
        <>
          <span className="flex-1 px-2 sm:px-4 truncate text-center text-bolt-elements-textPrimary">
            <ClientOnly>{() => <ChatDescription />}</ClientOnly>
          </span>
          <ClientOnly>
            {() => (
              // Ensure HeaderActionButtons are also responsive or managed correctly on mobile
              <div className="mr-1">
                <HeaderActionButtons />
              </div>
            )}
          </ClientOnly>
        </>
      )}
      {!chat.started && <div className="flex-1 sm:hidden"></div>} {/* Ensure header takes full width on mobile even if chat hasn't started */}
    </header>
  );
}
