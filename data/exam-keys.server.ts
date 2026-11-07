import 'server-only';

export const EXAM_KEYS: Record<string, Record<string, { correctOptionId: string; explanation: string }>> = {
  'exam-ai301-midterm': {
    q1: {
      correctOptionId: 'opt1_c',
      explanation: 'L2 regularization adds a penalty proportional to the sum of squared weights, penalizing large weights and preventing overfitting while retaining all features.',
    },
    q2: {
      correctOptionId: 'opt2_a',
      explanation: 'ReLU has a constant derivative of 1 for positive inputs, preventing gradient saturation and decay across deep layers unlike Sigmoid whose derivatives saturate near zero.',
    },
    q3: {
      correctOptionId: 'opt3_d',
      explanation: 'The kernel trick evaluates the inner product between mapped vectors directly using a kernel function, bypassing the costly explicit transformation to higher dimensions.',
    },
    q4: {
      correctOptionId: 'opt4_b',
      explanation: 'In highly imbalanced datasets, raw accuracy is deceptive because predicting only the majority class produces high accuracy. Recall measures sensitivity to critical positive instances.',
    },
    q5: {
      correctOptionId: 'opt5_c',
      explanation: 'Bagging trains diverse parallel learners on bootstrap subsets to lower variance, while Boosting trains sequentially by weighting difficult instances from previous learners.',
    },
    q6: {
      correctOptionId: 'opt6_b',
      explanation: 'Mini-batch SGD combines the smooth gradient estimates of full-batch training with the fast parallel matrix multiplication capabilities of modern GPUs and frequent weight updates.',
    },
  },
  'exam-ai305-quiz': {
    q_dl_1: {
      correctOptionId: 'b',
      explanation: 'Convolutional filters slide across the image sharing weights, preserving local spatial hierarchies with far fewer parameters than full dense connections.',
    },
    q_dl_2: {
      correctOptionId: 'a',
      explanation: 'MaxPooling downsamples feature maps by taking the maximum activation in each window, providing translational invariance and reducing computational load.',
    },
    q_dl_3: {
      correctOptionId: 'd',
      explanation: 'Transformers discard recurrence in favor of multi-head self-attention to process tokens in parallel, relying on positional encodings to inject sequential order.',
    },
    q_dl_4: {
      correctOptionId: 'c',
      explanation: 'Gradient clipping caps gradient norms to a maximum threshold, preventing numerical overflow and erratic weight updates in deep sequential unrolling.',
    },
    q_dl_5: {
      correctOptionId: 'b',
      explanation: 'Dropout sets random neuron activations to zero during training, breaking complex co-adaptations and behaving like an ensemble of sub-networks.',
    },
  },
  'exam-ai302-final': {
    nlp_1: {
      correctOptionId: 'c',
      explanation: 'Continuous Bag-of-Words (CBOW) predicts the center word from surrounding context, while Skip-gram learns by predicting surrounding context words given the center word.',
    },
    nlp_2: {
      correctOptionId: 'd',
      explanation: 'Standard bidirectional conditioning would allow each word to see itself in multi-layer context. Masking random tokens forces the model to reconstruct them based on surrounding context.',
    },
  },
  'exam-cs204-practical': {
    cv_q1: {
      correctOptionId: 'opt_b',
      explanation: 'Canny edge detection begins by convolving the image with a Gaussian smoothing filter to suppress high-frequency noise prior to gradient estimation.',
    },
    cv_q2: {
      correctOptionId: 'opt_a',
      explanation: 'Historically, OpenCV standardizes on BGR channel sequence for raster images rather than the web-standard RGB.',
    },
  },
};
