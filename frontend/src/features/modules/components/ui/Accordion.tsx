/**
 * Accordion Component
 * Expandable content sections for FAQs, course modules, etc.
 * Used for organizing content in collapsible panels
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const accordionVariants = cva('w-full', {
  variants: {
    variant: {
      default: 'divide-y divide-gray-200 dark:divide-gray-700',
      bordered: 'space-y-2',
      filled: 'space-y-2',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const accordionItemVariants = cva('', {
  variants: {
    variant: {
      default: '',
      bordered: 'rounded-lg border border-gray-300 dark:border-gray-700',
      filled: 'rounded-lg bg-gray-50 dark:bg-gray-800',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const accordionTriggerVariants = cva(
  'flex w-full items-center justify-between py-4 text-left text-sm font-medium transition-all hover:underline',
  {
    variants: {
      variant: {
        default: '',
        bordered: 'px-4',
        filled: 'px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const accordionContentVariants = cva('overflow-hidden text-sm transition-all', {
  variants: {
    variant: {
      default: 'pb-4 pt-0',
      bordered: 'px-4 pb-4',
      filled: 'px-4 pb-4',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps extends VariantProps<typeof accordionVariants> {
  items: AccordionItem[];
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  className?: string;
}

/**
 * Base Accordion Component
 */
export const Accordion: React.FC<AccordionProps> = ({
  items,
  type = 'single',
  defaultValue,
  value: controlledValue,
  onValueChange,
  variant,
  className,
}) => {
  const [openItems, setOpenItems] = React.useState<string[]>(() => {
    if (defaultValue) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    }
    return [];
  });

  const value = controlledValue !== undefined
    ? Array.isArray(controlledValue) ? controlledValue : [controlledValue]
    : openItems;

  const handleToggle = (itemId: string) => {
    let newValue: string[];

    if (type === 'single') {
      newValue = value.includes(itemId) ? [] : [itemId];
    } else {
      newValue = value.includes(itemId)
        ? value.filter(id => id !== itemId)
        : [...value, itemId];
    }

    setOpenItems(newValue);
    onValueChange?.(type === 'single' ? newValue[0] || '' : newValue);
  };

  return (
    <div className={cn(accordionVariants({ variant }), className)}>
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(accordionItemVariants({ variant }))}
        >
          <button
            onClick={() => !item.disabled && handleToggle(item.id)}
            disabled={item.disabled}
            className={cn(
              accordionTriggerVariants({ variant }),
              item.disabled && 'cursor-not-allowed opacity-50'
            )}
            aria-expanded={value.includes(item.id)}
            aria-controls={`accordion-content-${item.id}`}
          >
            <div className="flex items-center space-x-2">
              {item.icon && <span className="h-5 w-5">{item.icon}</span>}
              <span>{item.title}</span>
            </div>
            <svg
              className={cn(
                'h-5 w-5 shrink-0 transition-transform duration-200',
                value.includes(item.id) && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            id={`accordion-content-${item.id}`}
            className={cn(
              accordionContentVariants({ variant }),
              value.includes(item.id) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            )}
            aria-hidden={!value.includes(item.id)}
          >
            <div className="text-gray-600 dark:text-gray-400">{item.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * FAQ Accordion - Pre-configured for frequently asked questions
 */
export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQAccordionProps {
  faqs: FAQItem[];
  variant?: 'default' | 'bordered' | 'filled';
  className?: string;
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({
  faqs,
  variant = 'default',
  className,
}) => {
  const items: AccordionItem[] = faqs.map((faq, index) => ({
    id: `faq-${index}`,
    title: faq.question,
    content: <p>{faq.answer}</p>,
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  }));

  return <Accordion items={items} type="single" variant={variant} className={className} />;
};

/**
 * Course Modules Accordion - Pre-configured for LMS course structure
 */
export interface CourseModule {
  id: string;
  title: string;
  lessons: {
    id: string;
    title: string;
    duration?: string;
    completed?: boolean;
  }[];
  progress?: number;
}

export interface CourseModulesAccordionProps {
  modules: CourseModule[];
  onLessonClick?: (moduleId: string, lessonId: string) => void;
  className?: string;
}

export const CourseModulesAccordion: React.FC<CourseModulesAccordionProps> = ({
  modules,
  onLessonClick,
  className,
}) => {
  const items: AccordionItem[] = modules.map((module) => ({
    id: module.id,
    title: module.title,
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    content: (
      <div className="space-y-2">
        {module.progress !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{module.progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700">
              <div
                className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${module.progress}%` }}
              />
            </div>
          </div>
        )}
        {module.lessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => onLessonClick?.(module.id, lesson.id)}
            className="flex w-full items-center justify-between rounded-md p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="flex items-center space-x-3">
              {lesson.completed ? (
                <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="text-sm font-medium">{lesson.title}</span>
            </div>
            {lesson.duration && (
              <span className="text-xs text-gray-500 dark:text-gray-400">{lesson.duration}</span>
            )}
          </button>
        ))}
      </div>
    ),
  }));

  return <Accordion items={items} type="multiple" variant="bordered" className={className} />;
};

export { accordionVariants, accordionItemVariants, accordionTriggerVariants, accordionContentVariants };
