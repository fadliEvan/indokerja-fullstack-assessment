import React from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/common/PageContainer';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { AlertTriangle, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <PageContainer>
      <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <Card>
          <EmptyState
            icon={<AlertTriangle size={48} color="#f59e0b" />}
            title="404 - Halaman Tidak Ditemukan"
            description="Halaman yang Anda tuju tidak tersedia atau telah dipindahkan. Periksa kembali tautan URL Anda."
            action={
              <Link to="/">
                <Button variant="primary" leftIcon={<Home size={16} />}>
                  Kembali ke Beranda
                </Button>
              </Link>
            }
          />
        </Card>
      </div>
    </PageContainer>
  );
};
