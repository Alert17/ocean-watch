export interface RegisterBody {
  wallet: string;
  name?: string;
}

export interface LoginBody {
  wallet: string;
}

export interface ChallengeBody {
  wallet: string;
}

export interface VerifySignatureBody {
  wallet: string;
  nonce: string;
  signature: string;
  name?: string;
}
