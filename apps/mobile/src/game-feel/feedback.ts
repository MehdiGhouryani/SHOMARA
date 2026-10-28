/**
 * Mobile view of the shared P03 feedback contract. The dictionary itself lives in
 * `@math/contracts` so Android and Web render the same semantics.
 */
export {
  FEEDBACK_BUDGET_MS,
  FEEDBACK_BY_INTERACTION_EVENT,
  FEEDBACK_BY_SEMANTIC_EVENT,
  feedbackForInteraction,
  feedbackForSemanticEvent as feedbackForEvent,
  resolveFeedbackPresentation,
  semanticEventForOutcome,
  type FeedbackAudioCue,
  type FeedbackChannels,
  type FeedbackHaptic,
  type FeedbackMotion,
  type FeedbackPresentation,
  type FeedbackSpec,
  type FeedbackTone,
  type InteractionFeedbackEvent,
} from '@math/contracts';
